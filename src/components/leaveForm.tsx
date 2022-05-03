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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Realm from 'realm-web';
import { LeaveEntity } from '../model';
import { CLUSTER_NAME, COLLECTION_NAME, DATABASE_NAME, DB_DATE_FORMAT } from '../utils';

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
    from: Date;
    until: Date;
    days: number;
};

export function LeaveForm(props: Props) {
    const { open, user, selectedYear, leaveItem, onClose } = props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const mongo = user.mongoClient(CLUSTER_NAME);
    const items = mongo.db(DATABASE_NAME).collection(COLLECTION_NAME);

    const {
        control,
        formState: { errors },
        setValue,
        reset,
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
                setValue('from', new Date());
                setValue('until', new Date());
                setValue('days', 0);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const onSubmit = (data: LeaveFormType) => {
        let objectToStore: Partial<LeaveEntity> = {};

        setIsSubmitting(true);
        // Check if we add a new object or update an existing
        if (leaveItem) {
            objectToStore = {
                year: selectedYear,
                from: format(data.from, DB_DATE_FORMAT),
                until: format(data.until, DB_DATE_FORMAT),
                days: data.days,
            };

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
            objectToStore = {
                year: selectedYear,
                from: format(data.from, DB_DATE_FORMAT),
                until: format(data.until, DB_DATE_FORMAT),
                days: data.days,
                owner_id: user.id,
            };

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

    return (
        <Dialog
            fullWidth
            maxWidth={'sm'}
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                                    inputFormat='dd-MM-yyyy'
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id='from'
                                            fullWidth
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
                                    inputFormat='dd-MM-yyyy'
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            id='until'
                                            fullWidth
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
