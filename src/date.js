// TODO: DateTime and LocalDate
// probably wrap joda-js but needs functional typed API

// Naming:
// LocalDate -> DateLocal
// LocalTime -> TimeLocal
// LocalDateTime -> DateTimeLocal
// ZonedDateTime -> DateTimeZoned
// Period -> DateTimePeriod
// Duration -> TimeDuration
// Instant

// they didn't bother much with the port so might be useful to dropFirst
// some Java-only stuff

// Consider simplifying to avoid Year, YearMonth, Month, MonthDay, DayOfWeek
// but maybe they're required

// consider date-fns too, but it doesn't look like it support everything needed
