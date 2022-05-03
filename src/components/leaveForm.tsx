import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    TextField,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { DatePicker, LocalizationProvider, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, getYear, isSameDay, isWeekend, parse } from 'date-fns';
import enLocale from 'date-fns/locale/en-US';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Realm from 'realm-web';
import { LeaveEntity } from '../model';
import {
    calculateWorkingDays,
    CLUSTER_NAME,
    COLLECTION_NAME,
    DATABASE_NAME,
    DB_DATE_FORMAT,
    getHolidays,
} from '../utils';

const {
    BSON: { ObjectId },
} = Realm;

interface Props {
    user: Realm.User;
    open: boolean;
    selectedYear: number;
    leaveItem: LeaveEntity | undefined;
    onClose: () => void;
}

type LeaveFormType = {
    from: Date | null;
    until: Date | null;
    days: number;
};

export function LeaveForm(props: Props) {
    const { open, user, selectedYear, leaveItem, onClose } = props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const mongo = user.mongoClient(CLUSTER_NAME);
    const items = mongo.db(DATABASE_NAME).collection(COLLECTION_NAME);

    if (enLocale.options) {
        enLocale.options.weekStartsOn = 1;
    }

    const {
        control,
        formState: { errors },
        setValue,
        reset,
        watch,
        clearErrors,
        handleSubmit,
    } = useForm<LeaveFormType>();

    React.useEffect(() => {
        if (open) {
            reset();
            if (leaveItem) {
                setValue('from', parse(leaveItem.from, DB_DATE_FORMAT, new Date()));
                setValue('until', parse(leaveItem.until, DB_DATE_FORMAT, new Date()));
                setValue('days', leaveItem.days);
            } else {
                setValue('from', null);
                setValue('until', null);
                setValue('days', 0);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const onSubmit = (data: LeaveFormType) => {
        let objectToStore: Partial<LeaveEntity> = {};

        if (data.from && data.until) {
            objectToStore = {
                year: selectedYear,
                from: format(data.from, DB_DATE_FORMAT),
                until: format(data.until, DB_DATE_FORMAT),
                days: calculateWorkingDays(data.from, data.until),
            };
        }

        setIsSubmitting(true);
        // Check if we add a new object or update an existing
        if (leaveItem) {
            items
                .updateOne({ _id: new ObjectId(leaveItem._id) }, { $set: objectToStore })
                .then(() => {
                    setIsSubmitting(false);
                    enqueueSnackbar('Leave edited successfully.', { variant: 'success' });
                    onClose();
                })
                .catch((err) => {
                    setIsSubmitting(false);
                    enqueueSnackbar('Error editing leave.', { variant: 'error' });
                    console.error(`Failed to update item: ${err}`);
                });
        } else {
            objectToStore.owner_id = user.id;

            items
                .insertOne(objectToStore)
                .then(() => {
                    setIsSubmitting(false);
                    enqueueSnackbar('New leave added successfully.', { variant: 'success' });
                    onClose();
                })
                .catch((err) => {
                    setIsSubmitting(false);
                    enqueueSnackbar('Error adding new leave.', { variant: 'error' });
                    console.error(`Failed to insert item: ${err}`);
                });
        }
    };

    const deleteLeave = () => {
        if (leaveItem) {
            setIsSubmitting(true);
            items.deleteOne({ _id: new ObjectId(leaveItem._id) }).then(() => {
                setIsSubmitting(false);
                enqueueSnackbar('New leave deleted successfully.', { variant: 'success' });
                onClose();
            });
        }
    };

    const fromDate = watch('from');
    const untilDate = watch('until');

    const holidayRender = (
        day: Date | null,
        _value: Array<Date | null>,
        DayComponentProps: PickersDayProps<Date | null>,
    ) => {
        if (day) {
            const holidays = getHolidays(getYear(day));
            const isHoliday = holidays.some((holiday) => isSameDay(holiday, day));
            if (isHoliday) {
                return <PickersDay sx={{ color: red[500] }} {...DayComponentProps} />;
            }
        }
        return <PickersDay {...DayComponentProps} />;
    };

    return (
        <Dialog
            fullWidth
            maxWidth={'xs'}
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose();
                }
            }}
            open={open}
        >
            <DialogTitle>
                {leaveItem ? 'Edit Leave' : 'New Leave'}
                <IconButton
                    aria-label='close'
                    onClick={() => onClose()}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
                    <form id='leave-form' onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
                        <Controller
                            name='from'
                            control={control}
                            rules={{
                                required: 'This field is required',
                            }}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    label='From'
                                    maxDate={untilDate}
                                    inputFormat='dd-MM-yyyy'
                                    mask='__-__-____'
                                    shouldDisableDate={(date) => (date ? isWeekend(date) : false)}
                                    renderDay={holidayRender}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id='from'
                                            fullWidth
                                            size='small'
                                            margin='dense'
                                            error={!!errors.from}
                                            helperText={errors?.from?.message}
                                        />
                                    )}
                                />
                            )}
                        />

                        <Controller
                            name='until'
                            control={control}
                            rules={{
                                required: 'This field is required',
                            }}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    label='Until'
                                    minDate={fromDate}
                                    inputFormat='dd-MM-yyyy'
                                    mask='__-__-____'
                                    shouldDisableDate={(date) => (date ? isWeekend(date) : false)}
                                    renderDay={holidayRender}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id='until'
                                            fullWidth
                                            size='small'
                                            margin='dense'
                                            error={!!errors.until}
                                            helperText={errors?.until?.message}
                                        />
                                    )}
                                />
                            )}
                        />

                        <Controller
                            name='days'
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='days'
                                    label='Annual Leave Days'
                                    fullWidth
                                    value={calculateWorkingDays(fromDate, untilDate)}
                                    variant='outlined'
                                    size='small'
                                    margin='dense'
                                    disabled
                                />
                            )}
                        />

                        {isSubmitting && <LinearProgress />}
                    </form>
                </LocalizationProvider>
            </DialogContent>

            <DialogActions>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: leaveItem ? 'space-between' : 'flex-end',
                        width: '100%',
                    }}
                >
                    {leaveItem && (
                        <Button variant='outlined' color='error' onClick={deleteLeave}>
                            Delete
                        </Button>
                    )}

                    {leaveItem ? (
                        <Button
                            form='leave-form'
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={isSubmitting}
                        >
                            Update
                        </Button>
                    ) : (
                        <Button
                            form='leave-form'
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={isSubmitting}
                            onClick={() => clearErrors()}
                        >
                            Create
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}
