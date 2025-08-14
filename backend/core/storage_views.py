import uuid, mimetypes, datetime, os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

import boto3

class PresignUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # opcional: validar rol/ámbito si quieres restringir
        filename = request.data.get("filename")
        if not filename:
            return Response({"detail":"filename requerido"}, status=400)
        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        key = f"schools/{request.school_id}/{uuid.uuid4()}-{filename}"

        s3 = boto3.client("s3",
            endpoint_url=os.getenv("S3_ENDPOINT_URL"),  # p.ej. http://localhost:9000 para MinIO
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION","us-east-1"),
        )
        bucket = os.getenv("AWS_STORAGE_BUCKET_NAME")
        expires = 60 * 5
        presigned = s3.generate_presigned_post(
            Bucket=bucket,
            Key=key,
            Fields={"Content-Type": content_type},
            Conditions=[{"Content-Type": content_type}],
            ExpiresIn=expires,
        )
        return Response({"upload": presigned, "file_url": f"{os.getenv('S3_PUBLIC_URL_PREFIX', '')}/{key}"})
