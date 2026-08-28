// by AI, prompt:
// Create a react Typescript button with props for variant
// size fullWidth and className using the BEM-style
// classes like btn -- variant and btn -- size. Default these to
// primary and md then return a button repassing all props
// with the combined classes and children.

import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

const Button = ({
	variant = "primary",
	size = "md",
	fullWidth = false,
	className = "",
	children,
	...props
}: ButtonProps) => {
	const baseClass = "btn";
	const variantClass = `${baseClass}--${variant}`;
	const sizeClass = `${baseClass}--${size}`;
	const fullWidthClass = fullWidth ? `${baseClass}--full-width` : "";

	const combinedClasses = [
		baseClass,
		variantClass,
		sizeClass,
		fullWidthClass,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button className={combinedClasses} {...props}>
			{children}
		</button>
	);
};

export default Button;
