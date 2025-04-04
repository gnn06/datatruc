return Enumerable
.from(rows)
.except(toto, (el) => el.titre1)
.toArray();;