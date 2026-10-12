# Onboarding infrastructure boundary

Onboarding needs no provider adapters of its own: persistence goes through the shared Prisma client, and session/identity resolution is provided by the auth feature's public API.
