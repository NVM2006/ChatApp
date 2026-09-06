import {LoaderIcon} from "lucide-react";

function PageLoader() {
  return (
    <div className = "min-h-screen bg-slate-900 flex items-center justify-center">
      <LoaderIcon className = "size-10 animate-spin text-white"/>
    </div>
  )
}

export default PageLoader
