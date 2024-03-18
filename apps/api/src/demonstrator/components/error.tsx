export function Error(props: {message: string}) {
  return (
    <p class="mb-5 p-3 text-red rounded-md border border-rose-200 bg-rose-50">
      {props.message}
    </p>
  );
}
