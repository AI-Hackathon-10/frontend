import { apiRequest, ApiError } from './client.js'

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new ApiError('이미지 파일을 읽을 수 없습니다.', 0, 'INVALID_IMAGE'))
    }
    image.src = objectUrl
  })
}

async function convertToJpeg(file) {
  if (file.type === 'image/jpeg') return file

  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const context = canvas.getContext('2d')
  if (!context) {
    throw new ApiError('이미지 변환에 실패했습니다.', 0, 'IMAGE_CONVERSION_FAILED')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new ApiError('이미지 변환에 실패했습니다.', 0, 'IMAGE_CONVERSION_FAILED'))
      },
      'image/jpeg',
      0.92,
    )
  })
}

export function getPresignedUrl() {
  return apiRequest('/api/medications/upload/presigned-url', {
    method: 'POST',
    body: {},
  })
}

export async function uploadMedicationImage(uploadUrl, file) {
  const jpeg = await convertToJpeg(file)
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: jpeg,
    headers: { 'Content-Type': 'image/jpeg' },
  })

  if (!response.ok) {
    throw new ApiError('알약 사진 업로드에 실패했습니다.', response.status, 'S3_UPLOAD_FAILED')
  }
}

export function identifyMedication({ requestId, symptomTypes, startedAt }) {
  return apiRequest('/api/medications/identify', {
    method: 'POST',
    body: { requestId, symptomTypes, startedAt },
  })
}

export function markMedicationTaken(medicationId) {
  return apiRequest(`/api/medications/${medicationId}/intake`, {
    method: 'POST',
    body: {},
  })
}
