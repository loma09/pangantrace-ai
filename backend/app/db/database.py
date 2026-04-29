from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

DATABASE_URL = (
    f"mssql+aioodbc://{settings.AZURE_SQL_USERNAME}:{settings.AZURE_SQL_PASSWORD}"
    f"@{settings.AZURE_SQL_SERVER}/{settings.AZURE_SQL_DATABASE}"
    f"?driver=ODBC+Driver+18+for+SQL+Server"
)

engine = create_async_engine(DATABASE_URL, echo=settings.DEBUG)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
