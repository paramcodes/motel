# Motel (Airbnb Clone)

A peer-to-peer property rental marketplace enabling hosts to publish listings and guests to discover, filter, favorite, and book reservations with date-aware availability.

## Language

**Guest**:
An authenticated user browsing listings, managing favorites, and creating or canceling reservations.
_Avoid_: Renter, customer, traveler, buyer

**Host**:
A user capability unlocked by creating and publishing at least one listing, managing property details and viewing reservations.
_Avoid_: Owner, landlord, property manager

**Listing**:
A published property space offered by a host with location, pricing, capacity, room counts, amenities, photo gallery, and category.
_Avoid_: Property, rental, accommodation, unit

**Reservation**:
An atomic, confirmed booking spanning a check-in date to a check-out date for a listing by a guest.
_Avoid_: Booking, stay, appointment, order

**Availability Window**:
The contiguous calendar span during which a listing can accept reservations, computed dynamically by excluding active reservations.
_Avoid_: Vacancy, schedule, free dates

**Category**:
A curated visual classification (e.g., Beachfront, Cabins, Iconic cities, Countryside) displayed as an interactive filter pill in the navigation header.
_Avoid_: Type, tag, genre

**Favorite**:
A persisted user bookmark saving a listing to their personal wishlist.
_Avoid_: Like, bookmark, starred
