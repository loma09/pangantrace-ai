from fastapi import HTTPException, status


class PanganTraceException(Exception):
    """Base exception for PanganTrace AI."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class AzureServiceError(PanganTraceException):
    """Raised when an Azure service call fails."""

    def __init__(self, service: str, message: str):
        super().__init__(
            message=f"Azure {service} error: {message}",
            code="AZURE_SERVICE_ERROR",
        )
        self.service = service


class InsufficientDataError(PanganTraceException):
    """Raised when there isn't enough data for anomaly detection."""

    def __init__(self, required: int, provided: int):
        super().__init__(
            message=f"Minimum {required} data points required, got {provided}",
            code="INSUFFICIENT_DATA",
        )


class CommodityNotFoundError(PanganTraceException):
    """Raised when a commodity ID is not found."""

    def __init__(self, commodity_id: str):
        super().__init__(
            message=f"Commodity '{commodity_id}' not found",
            code="COMMODITY_NOT_FOUND",
        )


class FraudAnalysisError(PanganTraceException):
    """Raised when fraud analysis pipeline fails."""

    def __init__(self, message: str):
        super().__init__(message=message, code="FRAUD_ANALYSIS_ERROR")


def raise_http(exc: PanganTraceException, status_code: int = 400):
    """Convert PanganTrace exception to FastAPI HTTPException."""
    raise HTTPException(
        status_code=status_code,
        detail={"code": exc.code, "message": exc.message},
    )
