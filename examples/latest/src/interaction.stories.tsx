import { useState, useEffect, useCallback } from "react"
import { within, userEvent } from "@storybook/testing-library"
import { Meta, StoryObj } from "@storybook/react"

export default {
  title: "interaction",
  component: () => <div />,
} as Meta

export const WaitForClickEvent = {
  render: () => {
    const [clicked, setClicked] = useState(false)
    return (
      <div>
        <button onClick={() => setClicked(true)}>Click Me</button>
        {clicked && <span>clicked!</span>}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(screen.getByRole("button"))
  },
} as StoryObj

export const WaitForQuietClickEvent = {
  render: () => {
    const [clicked, setClicked] = useState(false)
    const handleClick = useCallback(() => {
      setTimeout(() => setClicked(true), 1000)
    }, [setClicked]);
    return (
      <div>
        <button onClick={handleClick}>Click Me</button>
        {clicked && <span>clicked!</span>}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(screen.getByRole("button"))
  },
} as StoryObj
