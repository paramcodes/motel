# 0001 PostgreSQL over MongoDB for Reservation Concurrency

The proposed stack suggested MongoDB + Prisma. We decided to use PostgreSQL with Prisma instead.

Airbnb reservation-aware availability filtering requires date-range exclusion constraints (`tsrange`), atomic double-booking prevention, and relational joins between Users, Listings, Reservations, and Favorites. Enforcing overlapping date constraints in MongoDB requires distributed application locks or multi-document transactions across replica sets, which introduces operational complexity and race condition risks. PostgreSQL provides native relational integrity and ACID isolation out of the box.
