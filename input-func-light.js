return Enumerable
    .from(rows)
    .select(row => ({...row, patchPolicy: row.patchPolicy + ' qsd'}))
    .toArray();