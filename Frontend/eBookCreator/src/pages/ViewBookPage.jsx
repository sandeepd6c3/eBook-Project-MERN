import React from 'react'
import { useParams } from 'react-router-dom'

const ViewBookPage = () => {
  const { bookId } = useParams()

  return (
    <div style={{ padding: 20 }}>
      <h2>View Book</h2>
      <p>Viewing book ID: {bookId}</p>
    </div>
  )
}

export default ViewBookPage

