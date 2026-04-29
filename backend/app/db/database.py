from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# Build connection string only if SQL settings are provided
_has_db = bool(settings.AZURE_SQL_SERVER and settings.AZURE_SQL_USERNAME)

if _has_db:
    DATABASE_URL = (
        f"mssql+aioodbc://{settings.AZURE_SQL_USERNAME}:{settings.AZURE_SQL_PASSWORD}"
        f"@{settings.AZURE_SQL_SERVER}/{settings.AZURE_SQL_DATABASE}"
        f"?driver=ODBC+Driver+18+for+SQL+Server"
    )
    engine = create_async_engine(DATABASE_URL, echo=settings.DEBUG)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
else:
    engine = None
    AsyncSessionLocal = None


class Base(DeclarativeBase):
    pass


async def init_db():
    if not _has_db or engine is None:
        logger.warning("⚠️ Azure SQL not configured, skipping DB init")
        return
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"⚠️ Database init failed (non-fatal): {e}")


async def get_db():
    if AsyncSessionLocal is None:
        raise RuntimeError("Database not configured")
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
