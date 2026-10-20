import { LoaderCircle } from "lucide-react";

// Shown instantly on navigation to an interview, its start page or its
// feedback while the server loads the data.
export default function Loading() {
  return (
    <div className="my-20 flex justify-center" role="status" aria-label="Loading">
      <LoaderCircle className="animate-spin text-primary" />
    </div>
  );
}
