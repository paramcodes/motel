# Research Prisma PostgreSQL Schema and Reservation Availability Constraints

Type: research
Status: open
Blocked by: 

## Question

What is the optimal Prisma PostgreSQL schema model for `User`, `Listing`, `Reservation`, and `Favorite` that guarantees atomic reservation booking without double-booking race conditions (evaluating PostgreSQL exclusion constraints vs serializable transactions) and enables high-performance date-overlap filtering (`WHERE NOT EXISTS (SELECT 1 FROM "Reservation" r WHERE r."listingId" = l.id AND r.status = 'CONFIRMED' AND r."startDate" < :checkout AND r."endDate" > :checkin)`)?
