import type { Meta, ComponentStoryObj } from "@storybook/react"

function Button() {
  return <button>Click Me</button>
}

export default { 
  title: "aaa",
  component: Button,
} as Meta

export const Main: ComponentStoryObj<typeof Button> = {
}
