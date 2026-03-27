export default function ScanButton({ onScan, isScanning, inputRef }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      // Strip the data URL prefix to get raw base64
      const base64 = dataUrl.split(',')[1]
      onScan(base64, file.type)
    }
    reader.readAsDataURL(file)

    // Reset so the same file can be selected again on "Scan Another"
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={isScanning}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 border text-stone font-sans font-semibold text-[13px] px-5 py-[11px] rounded-md transition-colors bg-transparent hover:bg-ink/[0.04] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ borderColor: 'var(--rule)' }}
        aria-label="Scan a bottle"
      >
        {isScanning ? <SpinnerIcon /> : <CameraIcon />}
        <span className="hidden sm:inline">Scan</span>
      </button>
    </>
  )
}

function CameraIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
