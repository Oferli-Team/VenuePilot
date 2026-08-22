import { ClipLoader } from "react-spinners";
import { type LoaderSizeProps } from "react-spinners/helpers/props";

export const Spinner = ({
  size = 20,
  color = "#F87F35",
  ...props
}: LoaderSizeProps) => <ClipLoader {...props} size={size} color={color} />;
