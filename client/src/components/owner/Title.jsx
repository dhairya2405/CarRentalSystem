// import React from 'react'

// const Title = ({title,subTitle}) => {
//   return (
//     <>
//       <h1 className='font-medium text-3xl'>{title}</h1>
//       <p className='text-sm md:text-base text-gray-500/90 mt-2'>{subTitle}</p>
//     </>
//   )
// }

// export default Title

// src/components/owner/Title.jsx
import React from 'react'

const Title = ({title,subTitle}) => {
  return (
    <>
      <h1 className='text-2xl font-bold text-gray-800'>{title}</h1>
      <p className='text-gray-500'>{subTitle}</p>
    </>
  )
}

export default Title


// Title.jsx
// import React from 'react'

// const Title = ({ title, subTitle }) => {
//   return (
//     <div className="mb-6">
//       <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
//       <p className="text-gray-500">{subTitle}</p>
//     </div>
//   )
// }

// export default Title
