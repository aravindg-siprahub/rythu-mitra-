"""
transport/models.py — Rythu Mitra Transport Booking Models
===========================================================
PRD §7.7 + §5a.10 requirements:
  - Transport provider profile (vehicle, capacity, availability, pricing)
  - TransportBooking with full lifecycle state machine:
    REQUEST_CREATED → OFFERS_RECEIVED → OFFER_ACCEPTED
    → CONFIRMED → IN_PROGRESS → COMPLETED
    CANCELED from any active state
"""
from django.db import models
from django.core.exceptions import ValidationError


class Transport(models.Model):
    """Transport provider profile — PRD §7.7: vehicle, availability, pricing."""
    vehicle_type = models.CharField(max_length=100)
    driver_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.vehicle_type} - {self.driver_name}"


class TransportBooking(models.Model):
    """
    Transport Booking — PRD §7.7 + §5a.10 Booking Lifecycle State Machine.

    State machine (same as WorkerBooking — PRD §5a.10):
        REQUEST_CREATED  → OFFERS_RECEIVED
        OFFERS_RECEIVED  → OFFER_ACCEPTED
        OFFER_ACCEPTED   → CONFIRMED
        CONFIRMED        → IN_PROGRESS
        IN_PROGRESS      → COMPLETED
        Any active state → CANCELED
    """

    # ── Booking lifecycle states (PRD §5a.10) ─────────────────────────────────
    REQUEST_CREATED = 'REQUEST_CREATED'
    OFFERS_RECEIVED = 'OFFERS_RECEIVED'
    OFFER_ACCEPTED  = 'OFFER_ACCEPTED'
    CONFIRMED       = 'CONFIRMED'
    IN_PROGRESS     = 'IN_PROGRESS'
    COMPLETED       = 'COMPLETED'
    CANCELED        = 'CANCELED'

    BOOKING_STATUS_CHOICES = [
        (REQUEST_CREATED, 'Request Created'),
        (OFFERS_RECEIVED, 'Offers Received'),
        (OFFER_ACCEPTED,  'Offer Accepted'),
        (CONFIRMED,       'Confirmed'),
        (IN_PROGRESS,     'In Progress'),
        (COMPLETED,       'Completed'),
        (CANCELED,        'Canceled'),
    ]

    # Valid forward transitions (PRD §5a.10 state machine)
    VALID_TRANSITIONS = {
        REQUEST_CREATED: [OFFERS_RECEIVED, CANCELED],
        OFFERS_RECEIVED: [OFFER_ACCEPTED, CANCELED],
        OFFER_ACCEPTED:  [CONFIRMED, CANCELED],
        CONFIRMED:       [IN_PROGRESS, CANCELED],
        IN_PROGRESS:     [COMPLETED, CANCELED],
        COMPLETED:       [],
        CANCELED:        [],
    }

    # ── Fields ────────────────────────────────────────────────────────────────
    transport = models.ForeignKey(
        Transport, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='bookings'
    )
    farmer_id = models.IntegerField(
        help_text="References the farmers.Farmer model (loose FK for now)"
    )
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    pickup_date = models.DateField(null=True, blank=True)
    load_type = models.CharField(
        max_length=200, blank=True, default='',
        help_text="e.g. 'Grain bags', 'Vegetable crates'"
    )
    load_weight_kg = models.FloatField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS_CHOICES,
        default=REQUEST_CREATED,
        db_index=True,
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Transport Booking'
        verbose_name_plural = 'Transport Bookings'

    def __str__(self):
        return f"Transport#{self.pk} [{self.status}] {self.origin} → {self.destination}"

    # ── State transition validation ────────────────────────────────────────────
    def transition_to(self, new_status: str) -> None:
        """
        Transition booking to new_status following the PRD §5a.10 state machine.
        Raises ValidationError if the transition is not permitted.
        """
        allowed = self.VALID_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValidationError(
                f"Invalid transport booking transition: {self.status} → {new_status}. "
                f"Allowed from {self.status}: {allowed}"
            )
        self.status = new_status
        self.save(update_fields=['status', 'updated_at'])

    def cancel(self) -> None:
        """Cancel the booking from any active state (PRD §5a.10)."""
        if self.status in (self.COMPLETED, self.CANCELED):
            raise ValidationError(
                f"Cannot cancel a booking in terminal state: {self.status}"
            )
        self.status = self.CANCELED
        self.save(update_fields=['status', 'updated_at'])

    @property
    def is_terminal(self) -> bool:
        """True if booking is in a terminal state (COMPLETED or CANCELED)."""
        return self.status in (self.COMPLETED, self.CANCELED)
