/**
 * The landing screen is self-contained — it takes no data props, only the
 * flow-host `onNext` callback. Kept as an explicit empty contract so the mock
 * and Screen stay in sync if data is added later.
 */
export type LandingMock = Record<string, never>;
