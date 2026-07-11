import { redirect } from 'next/navigation'

export default function EventsRedirect() {
  redirect('/actualites?filter=EVENT')
}
