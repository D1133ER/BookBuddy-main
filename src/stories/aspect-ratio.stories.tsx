// [build] library: 'shadcn'
import { AspectRatio } from "../components/ui/aspect-ratio";

const meta = {
  title: "ui/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;

export const Base = {
  render: () => (
    <AspectRatio ratio={16 / 9} className="bg-slate-50 dark:bg-slate-800">
      <img
        src="/hero-library.svg"
        alt="BookBuddy library illustration"
        className="rounded-md object-cover"
      />
    </AspectRatio>
  ),
  args: {},
};
