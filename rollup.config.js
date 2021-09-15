import sucrase from '@rollup/plugin-sucrase'

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs'
    }
  ],
  plugins: [
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript', 'jsx']
    })
  ]
}
