from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.db import close_db
from app.routers.v1.auth import router as v1_auth_router
from app.routers.v1.domain import router as v1_domain_router
from app.routers.v1.twofa import router as v1_twofa_router


logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(title="WELLDHAN API")

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Versioned API
    app.include_router(v1_auth_router, prefix="/api/v1")
    app.include_router(v1_twofa_router, prefix="/api/v1")
    app.include_router(v1_domain_router, prefix="/api/v1")

    # Compatibility (existing frontend uses /api/*)
    app.include_router(v1_auth_router, prefix="/api")
    app.include_router(v1_twofa_router, prefix="/api")
    app.include_router(v1_domain_router, prefix="/api")

    @app.on_event("shutdown")
    async def _shutdown():
        await close_db()

    return app


app = create_app()

