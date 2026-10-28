import * as React from "react";
import { Button } from "@/components/ui/button";

type SaveButtonProps = React.ComponentProps<typeof Button>;

export default function SaveButton(props: SaveButtonProps) {
  return <Button variant="default" {...props} />;
}
