return Enumerable
    .from(rows)
    .where(row => row.cve > 500)
    .toArray();