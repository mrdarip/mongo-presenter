import Link from 'next/link';
import { isValidUrl } from '@/lib/utils';

export default function TextToLink({ value }) {
  return isValidUrl(value) ? (
    <Link href={value}>
      Link
    </Link>
  ) : (
    value
  );
}