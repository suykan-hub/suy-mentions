# suy-mentions

A simple React mentions component.

## Installation

```bash
npm install suy-mentions
# or
yarn add suy-mentions
```

## Usage

```jsx
import { Mentions } from 'suy-mentions';

function App() {
  const handleChange = (value) => {
    console.log('Mentions value:', value);
  };

  return (
    <Mentions
      value=""
      onChange={handleChange}
      placeholder="Type @ to mention someone..."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | '' | The value of the mentions input |
| onChange | (value: string) => void | - | Callback when value changes |
| placeholder | string | 'Type @ to mention someone...' | Placeholder text |

## Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## License

MIT
