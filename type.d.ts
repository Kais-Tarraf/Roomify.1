interface AuthState {
	isSignedIn: boolean;
	userName: string | null;
	userId: string | null;
}
type AuthContext = {
	isSignedIn: boolean;
	userName: string | null;
	userId: string | null;
	refreshAuth: () => Promise<boolean>;
	signOut: () => Promise<boolean>;
	signIn: () => Promise<boolean>;
};
