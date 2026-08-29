import React, { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import {
	PROGRESS_INCREMENT,
	REDIRECT_DELAY_MS,
	PROGRESS_INTERVAL_MS,
} from "../lib/constants";
// The upload functionality(not UI) was implemented with AI, prompt:
// Update the Upload component by adding
// drag-and-drop handlers and an onChange
// function that passes files to a new
// processFile function. Inside processFile, use
// FileReader to get a Base64 string and
// setInterval to increment progress using
// constants from lib/constants.ts file. When
// progress reaches 100, clear the interval and
// call onComplete with the Base64 data after
// a REDIRECT_DELAY_MS delay. Ensure all
// upload logic is blocked if isSignedIn is false
// and the dropzone UI reflects the isDragging
// state.

interface UploadProps {
	onComplete?: (base64File: string) => Promise<boolean | void> | boolean | void;
}

const Upload = ({ onComplete }: UploadProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [progress, setProgress] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const { isSignedIn } = useOutletContext<AuthContext>();

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, []);

	const processFile = useCallback(
		(file: File) => {
			if (!isSignedIn) return;
			setFile(file);
			setProgress(0);
			const reader = new FileReader();
			reader.onerror = () => {
				setFile(null);
				setProgress(0);
			};
			reader.onloadend = () => {
				const base64Data = reader.result as string;
				intervalRef.current = setInterval(() => {
					setProgress((prev) => {
						const next = prev + PROGRESS_INCREMENT;
						if (next >= 100) {
							if (intervalRef.current) {
								clearInterval(intervalRef.current);
								intervalRef.current = null;
							}
							timeoutRef.current = setTimeout(() => {
								onComplete?.(base64Data);
								timeoutRef.current = null;
							}, REDIRECT_DELAY_MS);
							return 100;
						}
						return next;
					});
				}, PROGRESS_INTERVAL_MS);
			};
			reader.readAsDataURL(file);
		},
		[isSignedIn, onComplete]
	);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (!isSignedIn) return;
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		if (!isSignedIn) return;

		const droppedFile = e.dataTransfer.files[0];
		const allowedTypes = ["image/jpeg", "image/png"];
		if (droppedFile && allowedTypes.includes(droppedFile.type)) {
			processFile(droppedFile);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isSignedIn) return;

		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			processFile(selectedFile );
		}
	};

	return (
		<div className="upload">
			{!file ? (
				<div
					className={`dropzone ${isDragging ? "is-dragging" : ""}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<input
						type="file"
						className="drop-input"
						accept=".jpg,.jpeg,.png,.webp"
						disabled={!isSignedIn}
						onChange={handleChange}
					/>

					<div className="drop-content">
						<div className="drop-icon">
							<UploadIcon size={20} />
						</div>
						<p>
							{isSignedIn
								? "Click to upload or just drag and drop"
								: "Sign in or sign up with Puter to upload"}
						</p>
						<p className="help">Maximum file size 50 MB.</p>
					</div>
				</div>
			) : (
				<div className="upload-status">
					<div className="status-content">
						<div className="status-icon">
							{progress === 100 ? (
								<CheckCircle2 className="check" />
							) : (
								<ImageIcon className="image" />
							)}
						</div>

						<h3>{file.name}</h3>

						<div className="progress">
							<div className="bar" style={{ width: `${progress}%` }} />

							<p className="status-text">
								{progress < 100 ? "Analyzing Floor Plan..." : "Redirecting..."}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default Upload;
