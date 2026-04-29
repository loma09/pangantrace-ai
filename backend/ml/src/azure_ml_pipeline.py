"""
Azure ML Pipeline untuk PanganTrace AI.
Registers models, creates endpoints, dan schedules retraining.
"""

import os
from typing import Dict, Optional


class AzureMLPipeline:
    """
    Manages the full Azure ML lifecycle:
    1. Register model ke Azure ML workspace
    2. Deploy sebagai managed endpoint
    3. Schedule retraining mingguan
    """

    def __init__(
        self,
        subscription_id: Optional[str] = None,
        resource_group: Optional[str] = None,
        workspace_name: Optional[str] = None,
    ):
        self.subscription_id = subscription_id or os.getenv("AZURE_SUBSCRIPTION_ID", "")
        self.resource_group = resource_group or os.getenv("AZURE_RESOURCE_GROUP", "")
        self.workspace_name = workspace_name or os.getenv("AZURE_ML_WORKSPACE", "")

    def get_workspace(self):
        """Connect to Azure ML Workspace."""
        try:
            from azure.ai.ml import MLClient
            from azure.identity import DefaultAzureCredential

            credential = DefaultAzureCredential()
            ml_client = MLClient(
                credential=credential,
                subscription_id=self.subscription_id,
                resource_group_name=self.resource_group,
                workspace_name=self.workspace_name,
            )
            print(f"✅ Connected to Azure ML: {self.workspace_name}")
            return ml_client
        except Exception as e:
            print(f"⚠️  Azure ML connection failed: {e}")
            return None

    def register_fraud_model(self, model_path: str, model_name: str = "pangantrace-fraud") -> Dict:
        """Register trained fraud model ke Azure ML."""
        ml_client = self.get_workspace()
        if not ml_client:
            return {"status": "error", "message": "Cannot connect to Azure ML"}

        try:
            from azure.ai.ml.entities import Model
            from azure.ai.ml.constants import AssetTypes

            model = Model(
                path=model_path,
                name=model_name,
                type=AssetTypes.CUSTOM_MODEL,
                description="PanganTrace AI fraud detection model (GBM + Isolation Forest)",
                tags={
                    "framework": "scikit-learn",
                    "task": "fraud_detection",
                    "commodity": "pangan_pokok",
                },
            )
            registered = ml_client.models.create_or_update(model)
            print(f"✅ Model registered: {registered.name} v{registered.version}")
            return {
                "status": "success",
                "name": registered.name,
                "version": registered.version,
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def register_price_model(self, model_path: str, model_name: str = "pangantrace-price") -> Dict:
        """Register trained price forecasting model ke Azure ML."""
        ml_client = self.get_workspace()
        if not ml_client:
            return {"status": "error", "message": "Cannot connect to Azure ML"}

        try:
            from azure.ai.ml.entities import Model
            from azure.ai.ml.constants import AssetTypes

            model = Model(
                path=model_path,
                name=model_name,
                type=AssetTypes.CUSTOM_MODEL,
                description="PanganTrace AI price forecasting model (Prophet + SMA)",
                tags={
                    "framework": "prophet",
                    "task": "price_forecasting",
                    "forecast_horizon": "7_days",
                },
            )
            registered = ml_client.models.create_or_update(model)
            print(f"✅ Model registered: {registered.name} v{registered.version}")
            return {
                "status": "success",
                "name": registered.name,
                "version": registered.version,
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_endpoint_config(self, model_name: str) -> Dict:
        """Generate endpoint configuration for deployment."""
        return {
            "endpoint_name": f"pangantrace-{model_name}-ep",
            "deployment_name": f"{model_name}-v1",
            "instance_type": "Standard_DS3_v2",
            "instance_count": 1,
            "scoring_script": "score.py",
            "environment": {
                "name": "pangantrace-inference",
                "python_version": "3.11",
                "packages": [
                    "scikit-learn>=1.4",
                    "pandas>=2.0",
                    "numpy>=1.24",
                    "joblib>=1.3",
                ],
            },
        }
