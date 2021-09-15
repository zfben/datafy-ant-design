import React from 'react'
import { render, screen } from '@testing-library/react'

import { DatafyEmpty } from '..'

test('should work', () => {
  render(<DatafyEmpty />)

  expect(screen.getByText('空')).toBeInTheDocument()
})
