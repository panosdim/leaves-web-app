import {
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import * as Realm from 'realm-web';
import { DBResults } from '../model';
import { CLUSTER_NAME, COLLECTION_NAME, DATABASE_NAME } from '../utils';

type LeavesTableProps = {
    user: Realm.User;
    selectedYear: number;
};
export function LeavesTable({ user, selectedYear }: LeavesTableProps) {
    const [leaves, setLeaves] = useState<DBResults>([]);
    const [selectedRow, setSelectedRow] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const mongo = user.mongoClient(CLUSTER_NAME);
    const items = mongo.db(DATABASE_NAME).collection(COLLECTION_NAME);

    React.useEffect(() => {
        setSelectedRow('');
        setIsLoading(true);

        items.find({ year: selectedYear }).then((leaves: DBResults) => {
            setIsLoading(false);
            setLeaves(leaves);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear]);

    const handleClick = (_e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, id: string) => {
        setSelectedRow(id);
        // onSelectionChange(clicsState.find((item) => item._id.toString() === id));
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                <TableHead>
                    <TableRow>
                        <TableCell>From</TableCell>
                        <TableCell>Until</TableCell>
                        <TableCell align='right'>Days</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow key='loading'>
                            <TableCell colSpan={9} align='center'>
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : (
                        leaves.map((row) => {
                            const isSelected = selectedRow === row._id.toString();
                            return (
                                <TableRow
                                    key={row._id}
                                    hover
                                    selected={isSelected}
                                    onClick={(e) => handleClick(e, row._id.toString())}
                                    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component='th' scope='row'>
                                        {row.from}
                                    </TableCell>
                                    <TableCell>{row.until}</TableCell>
                                    <TableCell align='right'>{row.days}</TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
