interface Error {
  param: string | null;
  message: string;
}

interface FormErrorsProps {
  errors: Error[];
  param?: string;
}

export default function FormErrors(props: FormErrorsProps) {
  if (!props.errors || !props.errors.length) {
    return null;
  }
  
  const errors = props.errors.filter(error => 
    (props.param ? error.param === props.param : error.param == null)
  );

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="alert alert-error mt-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        {/* <h3 className="font-bold">{errors.length > 1 ?  '' : ''}</h3> */}
        <ul className="list-disc list-inside">
          {errors.map((e, i) => (
            <span key={i}>{e.message}</span>
          ))}
        </ul>
      </div>
    </div>
  );
}