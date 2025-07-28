import { FileUpload } from '@/components/ui/file-upload'

export default function UploadSection() {
  return (
    <div className="dashboard-section">
      <div className='grow overflow-y-auto p-4 sm:p-6'>
        <FileUpload />
      </div>
    </div>
  )
}
