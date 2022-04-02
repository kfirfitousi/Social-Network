class LoginPage extends React.Component {
	constructor(props) {
		super(props);
		this.handleLogin = this.handleLogin.bind(this);
		this.handleSignup = this.handleSignup.bind(this);
		this.state = {
			loginEmail: '',
			loginPassword: '',
			loginAlert: '',
			signUpName: '',
			signUpEmail: '',
			signUpPassword: '',
			signupAlert: ''
		};
	}

	async handleLogin() {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: this.state.loginEmail.replace(' ', ''),
				password: this.state.loginPassword
			})
		});

		if (response.status != 200) {
			clearTimeout(this.loginAlertTimeout);
			this.setState({ loginAlert: 'Error: ' + (await response.text()) });
			return this.loginAlertTimeout = setTimeout(() => {
				this.setState({ loginAlert: '' });
			}, 3000);
		}

		const { token } = await response.json();
		document.cookie = token;
		window.location = '/';
	}

	async handleSignup() {
		const response = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: this.state.signUpName,
				email: this.state.signUpEmail.replace(' ', ''),
				password: this.state.signUpPassword
			})
		});

		if (response.status != 201) {
			clearTimeout(this.signupAlertTimeout);
			this.setState({ signupAlert: 'Error: ' + (await response.text()) });
			return this.signupAlertTimeout = setTimeout(() => {
				this.setState({ signupAlert: '' });
			}, 3000);
		}

		this.setState({
			loginEmail: this.state.signUpEmail.replace(' ', ''),
			loginPassword: this.state.signUpPassword
		});

		this.handleLogin();
	}

	render() {
		return React.createElement(
			'main',
			{ className: 'container' },
			React.createElement(
				'section',
				{ className: 'logo' },
				React.createElement('img', { src: 'logo.svg', alt: 'logo' })
			),
			React.createElement(
				'section',
				{ className: 'column' },
				React.createElement(
					'h1',
					{ className: 'center' },
					'Login'
				),
				React.createElement('input', {
					type: 'text',
					placeholder: 'Email',
					onChange: e => this.setState({ loginEmail: e.target.value })
				}),
				React.createElement('input', {
					type: 'password',
					placeholder: 'Password',
					onChange: e => this.setState({ loginPassword: e.target.value })
				}),
				React.createElement(
					'button',
					{ onClick: this.handleLogin },
					'Login'
				),
				this.state.loginAlert && React.createElement(
					'div',
					{ className: 'alert' },
					this.state.loginAlert
				)
			),
			React.createElement(
				'section',
				{ className: 'column' },
				React.createElement(
					'h1',
					{ className: 'center' },
					'Sign Up'
				),
				React.createElement('input', {
					type: 'text',
					placeholder: 'Name',
					onChange: e => this.setState({ signUpName: e.target.value })
				}),
				React.createElement('input', {
					type: 'text',
					placeholder: 'Email',
					onChange: e => this.setState({ signUpEmail: e.target.value })
				}),
				React.createElement('input', {
					type: 'password',
					placeholder: 'Password',
					onChange: e => this.setState({ signUpPassword: e.target.value })
				}),
				React.createElement(
					'button',
					{ onClick: this.handleSignup },
					'Sign Up'
				),
				this.state.signupAlert && React.createElement(
					'div',
					{ className: 'alert' },
					this.state.signupAlert
				)
			)
		);
	}
}

class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {},
			posts: [],
			messages: [],
			pendingPosts: false,
			pendingMessages: false
		};
	}

	async componentDidMount() {
		const user = this.props.user || (await getUser());
		const posts = this.props.posts || (await fetchPosts(document.cookie, user.uid, 2));
		const messages = this.props.messages || (await fetchMessages(document.cookie, 1));
		this.setState({ user, posts, messages });

		setInterval(async () => {
			const posts = await fetchPosts(document.cookie, this.state.user.uid, 10);
			const pendingPosts = posts[1] && this.state.posts[1] && posts[1].id != this.state.posts[1].id;

			const messages = await fetchMessages(document.cookie, 10);
			const pendingMessages = messages[0] && this.state.messages[0] && messages[0].id != this.state.messages[0].id;

			this.setState({ pendingPosts, pendingMessages });
		}, 20000);
	}

	handleLogout() {
		document.cookie = null;
		window.location = '/login';
	}

	render() {
		return React.createElement(
			'nav',
			{ className: 'navbar' },
			React.createElement(
				'ul',
				null,
				React.createElement(
					'a',
					{ href: '/' },
					React.createElement(
						'li',
						{ className: this.state.pendingPosts ? 'pending' : undefined },
						'Home'
					)
				),
				React.createElement(
					'a',
					{ href: '/messages' },
					React.createElement(
						'li',
						{ className: this.state.pendingMessages ? 'pending' : undefined },
						'Messages'
					)
				),
				this.state.user.isAdmin && React.createElement(
					'a',
					{ href: '/admin' },
					React.createElement(
						'li',
						null,
						'Admin'
					)
				),
				React.createElement(
					'a',
					{ href: '/about' },
					React.createElement(
						'li',
						null,
						'About'
					)
				),
				React.createElement(
					'li',
					{ className: 'greet thin' },
					'Hello, ',
					this.state.user.name
				),
				React.createElement(
					'a',
					{ className: 'logout', onClick: this.handleLogout },
					React.createElement(
						'li',
						null,
						'Logout'
					)
				)
			)
		);
	}
}

class HomePage extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {
			isLoading: true,
			user: {},
			posts: [],
			content: '',
			alert: ''
		};
	}

	async componentDidMount() {
		const user = await getUser();
		const posts = await fetchPosts(document.cookie, user.uid, 10);
		this.setState({ user, posts, isLoading: false });
	}

	async handleSubmit() {
		const response = await fetch('/api/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + document.cookie
			},
			body: JSON.stringify({ content: this.state.content })
		});

		if (response.status != 201) return this.showAlert('Error: ' + (await response.text()));

		const posts = await fetchPosts(document.cookie, this.state.user.uid, 10);
		this.setState({ posts, content: '' });
		this.showAlert('Post published');
	}

	handlePlusClick() {
		window.scrollTo(0, document.body.scrollHeight);
		document.getElementsByTagName('textarea')[0].focus();
	}

	showAlert(message) {
		clearTimeout(this.alertTimeout);
		this.setState({ alert: message });
		this.alertTimeout = setTimeout(() => {
			this.setState({ alert: '' });
		}, 3000);
	}

	render() {
		if (this.state.isLoading) return React.createElement(
			'p',
			null,
			'Loading..'
		);else return React.createElement(
			'div',
			null,
			React.createElement(
				'header',
				null,
				React.createElement(NavBar, { user: this.state.user, posts: this.state.posts })
			),
			React.createElement(
				'main',
				{ className: 'container' },
				React.createElement(
					'h1',
					null,
					'Posts'
				),
				React.createElement(
					'button',
					{ className: 'plus', onClick: this.handlePlusClick },
					'+'
				),
				React.createElement(
					'section',
					{ className: 'posts' },
					this.state.posts.map((post, i) => React.createElement(Post, {
						key: i,
						post: post,
						featured: i == 0 && post.uid == this.state.user.uid
					}))
				),
				React.createElement(
					'section',
					{ className: 'newPost' },
					React.createElement(
						'h2',
						{ className: 'center' },
						'Write a new post:'
					),
					React.createElement('textarea', {
						value: this.state.content,
						onChange: e => this.setState({ content: e.target.value }),
						placeholder: 'Write your post here',
						rows: '5'
					}),
					React.createElement(
						'button',
						{ className: 'big', onClick: this.handleSubmit },
						'Publish'
					),
					this.state.alert && React.createElement(
						'div',
						{ className: 'alert' },
						this.state.alert
					)
				)
			)
		);
	}
}

function Post(props) {
	return React.createElement(
		'article',
		{ className: props.featured ? 'featured post' : 'post' },
		props.featured && React.createElement(
			'p',
			{ className: 'thin' },
			'Here\'s your latest post:'
		),
		!props.featured && React.createElement(
			'h3',
			{ className: 'username' },
			props.post.username,
			':'
		),
		React.createElement(
			'section',
			{ className: 'content thin' },
			props.post.content
		),
		React.createElement(
			'p',
			{ className: 'date small thin' },
			new Date(props.post.created).toLocaleString()
		)
	);
}

class MessagesPage extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {
			isLoading: true,
			user: {},
			messages: [],
			content: '',
			to: '',
			alert: ''
		};
	}

	async componentDidMount() {
		const user = await getUser();
		const messages = await fetchMessages(document.cookie, 10);
		this.setState({ user, messages, isLoading: false });
	}

	async handleSubmit() {
		const response = await fetch('/api/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + document.cookie
			},
			body: JSON.stringify({
				to: this.state.to == '' ? undefined : this.state.to,
				content: this.state.content == '' ? undefined : this.state.content
			})
		});

		if (response.status != 200) return this.showAlert('Error: ' + (await response.text()));

		this.setState({ content: '' });
		this.showAlert('Message sent');
	}

	handlePlusClick() {
		window.scrollTo(0, document.body.scrollHeight);
		document.getElementsByTagName('textarea')[0].focus();
	}

	showAlert(message) {
		clearTimeout(this.alertTimeout);
		this.setState({ alert: message });
		this.alertTimeout = setTimeout(() => {
			this.setState({ alert: '' });
		}, 3000);
	}

	render() {
		if (this.state.isLoading) return React.createElement(
			'p',
			null,
			'Loading..'
		);else return React.createElement(
			'div',
			null,
			React.createElement(
				'header',
				null,
				React.createElement(NavBar, { user: this.state.user, messages: this.state.messages })
			),
			React.createElement(
				'main',
				{ className: 'container' },
				React.createElement(
					'h1',
					null,
					'Messages'
				),
				React.createElement(
					'button',
					{ className: 'plus', onClick: this.handlePlusClick },
					'+'
				),
				React.createElement(
					'section',
					{ className: 'messages' },
					this.state.messages.length == 0 && React.createElement(
						'p',
						{ className: 'thin' },
						'No messages'
					),
					this.state.messages.map((msg, i) => React.createElement(Message, { key: i, message: msg }))
				),
				React.createElement(
					'section',
					{ className: 'newMessage' },
					React.createElement(
						'h2',
						{ className: 'center' },
						'Write a new message:'
					),
					React.createElement('textarea', {
						value: this.state.content,
						onChange: e => this.setState({ content: e.target.value }),
						placeholder: 'Write your message here',
						rows: '5'
					}),
					React.createElement(
						'div',
						{ className: 'row' },
						React.createElement('input', {
							type: 'number',
							placeholder: 'Recipient id',
							value: this.state.to,
							onChange: e => this.setState({ to: e.target.value })
						}),
						React.createElement(
							'button',
							{ className: 'big', onClick: this.handleSubmit },
							'Send'
						)
					),
					this.state.alert && React.createElement(
						'div',
						{ className: 'alert' },
						this.state.alert
					)
				)
			)
		);
	}
}

function Message(props) {
	return React.createElement(
		'article',
		{ className: 'message thin' },
		React.createElement(
			'p',
			{ className: 'username' },
			React.createElement(
				'b',
				null,
				'From:'
			),
			' ',
			props.message.fromName,
			React.createElement(
				'span',
				{ className: 'small' },
				' (user id: ',
				props.message.from,
				')'
			)
		),
		React.createElement(
			'section',
			{ className: 'content' },
			props.message.content
		),
		React.createElement(
			'p',
			{ className: 'small' },
			new Date(props.message.created).toLocaleString()
		)
	);
}

class AdminPage extends React.Component {
	constructor(props) {
		super(props);
		this.handleRequest = this.handleRequest.bind(this);
		this.handleActivate = this.handleActivate.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleSuspend = this.handleSuspend.bind(this);
		this.handleMessageAll = this.handleMessageAll.bind(this);
		this.state = {
			isLoading: true,
			user: {},
			requests: [],
			uid: '',
			content: '',
			statusAlert: '',
			msgAlert: ''
		};
	}

	async componentDidMount() {
		const user = await getUser();

		if (!user.isAdmin) return window.location = '/';

		const requests = await this.fetchRequests();
		this.setState({ user, requests, isLoading: false });
	}

	async fetchRequests() {
		const response = await fetch('/api/users/requests', {
			headers: { 'Authorization': 'Bearer ' + document.cookie }
		});

		const requests = await response.json();
		return requests;
	}

	async handleRequest(approved, req) {
		const response = await fetch('/api/users/requests/' + req.id, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + document.cookie
			},
			body: JSON.stringify({ approved })
		});

		if (response.status != 200) return alert('Error: ' + (await response.text()));

		const requests = await this.fetchRequests();
		this.setState({ requests });
	}

	async handleStatusChange(status) {
		if (this.state.uid == '') return this.showStatusAlert('Error: Missing user id');

		const response = await fetch('/api/users/' + this.state.uid + '/status', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + document.cookie
			},
			body: JSON.stringify({ status })
		});

		if (response.status != 200) return this.showStatusAlert('Error: ' + (await response.text()));

		const msg = status == 'active' ? 'User activated' : 'User suspended';
		this.showStatusAlert(msg);
	}

	handleActivate() {
		this.handleStatusChange('active');
	}

	handleSuspend() {
		this.handleStatusChange('suspended');
	}

	async handleDelete() {
		if (this.state.uid == '') return this.showStatusAlert('Error: Missing user id');

		const response = await fetch('/api/users/' + this.state.uid, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + document.cookie
			}
		});

		if (response.status != 200) return this.showStatusAlert('Error: ' + (await response.text()));

		this.showStatusAlert('User deleted');
	}

	async handleMessageAll() {
		const response = await fetch('/api/messages/all', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + document.cookie
			},
			body: JSON.stringify({ content: this.state.content == '' ? undefined : this.state.content })
		});

		if (response.status != 200) return this.showMsgAlert('Error: ' + (await response.text()));

		this.showMsgAlert('Message sent');
	}

	showStatusAlert(message) {
		clearTimeout(this.alertTimeout);
		this.setState({ alert: message });
		this.alertTimeout = setTimeout(() => {
			this.setState({ alert: '' });
		}, 3000);
	}

	showMsgAlert(message) {
		clearTimeout(this.msgAlertTimeout);
		this.setState({ msgAlert: message });
		this.msgAlertTimeout = setTimeout(() => {
			this.setState({ msgAlert: '' });
		}, 3000);
	}

	render() {
		if (this.state.isLoading) return React.createElement(
			'p',
			null,
			'Loading..'
		);else return React.createElement(
			'div',
			null,
			React.createElement(
				'header',
				null,
				React.createElement(NavBar, { user: this.state.user })
			),
			React.createElement(
				'main',
				{ className: 'container' },
				React.createElement(
					'h1',
					null,
					'Admin Panel'
				),
				React.createElement(
					'h2',
					null,
					'User requests:'
				),
				React.createElement(
					'section',
					{ className: 'requests' },
					this.state.requests.length == 0 && React.createElement(
						'p',
						{ className: 'thin' },
						'No requests'
					),
					this.state.requests.map((req, i) => React.createElement(UserRequest, {
						key: i,
						request: req,
						handleRequest: this.handleRequest
					}))
				),
				React.createElement(
					'h2',
					{ className: 'center' },
					'Set user status:'
				),
				React.createElement(
					'section',
					{ className: 'setStatus' },
					React.createElement(
						'div',
						{ className: 'row' },
						React.createElement('input', {
							type: 'number',
							placeholder: 'User id',
							value: this.state.uid,
							onChange: e => this.setState({ uid: e.target.value })
						}),
						React.createElement(
							'button',
							{ onClick: this.handleDelete },
							'Delete'
						),
						React.createElement(
							'button',
							{ onClick: this.handleSuspend },
							'Suspend'
						),
						React.createElement(
							'button',
							{ onClick: this.handleActivate },
							'Activate'
						)
					),
					this.state.alert && React.createElement(
						'div',
						{ className: 'alert' },
						this.state.alert
					)
				),
				React.createElement(
					'h2',
					{ className: 'center' },
					'Message all users:'
				),
				React.createElement(
					'section',
					{ className: 'messageAll' },
					React.createElement('textarea', {
						value: this.state.content,
						onChange: e => this.setState({ content: e.target.value }),
						placeholder: 'Write your message here',
						rows: '5'
					}),
					React.createElement(
						'button',
						{ className: 'big', onClick: this.handleMessageAll },
						'Send'
					),
					this.state.msgAlert && React.createElement(
						'div',
						{ className: 'alert' },
						this.state.msgAlert
					)
				)
			)
		);
	}
}

class UserRequest extends React.Component {
	constructor(props) {
		super(props);
		this.handleApprove = this.handleApprove.bind(this);
		this.handleDeny = this.handleDeny.bind(this);
	}

	handleApprove() {
		if (this.props.handleRequest) this.props.handleRequest(true, this.props.request);
	}

	handleDeny() {
		if (this.props.handleRequest) this.props.handleRequest(false, this.props.request);
	}

	render() {
		return React.createElement(
			'div',
			{ className: 'request' },
			React.createElement(
				'p',
				{ className: 'thin' },
				React.createElement(
					'b',
					null,
					'Name:'
				),
				' ',
				this.props.request.name,
				React.createElement('br', null),
				React.createElement(
					'b',
					null,
					'Email:'
				),
				' ',
				this.props.request.email,
				React.createElement('br', null),
				React.createElement(
					'b',
					null,
					'Created:'
				),
				' ',
				new Date(this.props.request.created).toLocaleString()
			),
			React.createElement(
				'p',
				null,
				React.createElement(
					'button',
					{ onClick: this.handleApprove },
					'Approve'
				),
				React.createElement(
					'button',
					{ onClick: this.handleDeny },
					'Deny'
				)
			)
		);
	}
}

class AboutPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			user: {}
		};
	}

	async componentDidMount() {
		const user = await getUser();
		this.setState({ user, isLoading: false });
	}

	render() {
		if (this.state.isLoading) return React.createElement(
			'p',
			null,
			'Loading..'
		);else return React.createElement(
			'div',
			null,
			React.createElement(
				'header',
				null,
				React.createElement(NavBar, { user: this.state.user })
			),
			React.createElement(
				'main',
				{ className: 'container' },
				React.createElement(
					'h1',
					null,
					'About'
				),
				React.createElement(
					'section',
					{ className: 'content' },
					React.createElement(
						'h2',
						null,
						'Exercise 3 in Javascript'
					),
					React.createElement(
						'p',
						{ className: 'thin' },
						React.createElement(
							'b',
							null,
							'Name:'
						),
						' Kfir Fitousi'
					),
					React.createElement(
						'p',
						{ className: 'thin' },
						React.createElement(
							'b',
							null,
							'ID:'
						),
						' 316413152'
					)
				)
			)
		);
	}
}

fetchPosts = async (token, uid, n) => {
	const response = await fetch('/api/posts', {
		headers: { 'Authorization': 'Bearer ' + token }
	});

	const posts = await response.json();

	posts.forEach(post => {
		// fix newlines
		post.content = post.content.split('\n').map((str, i) => React.createElement(
			'p',
			{ key: i },
			str
		));
	});

	const sortedPosts = posts.sort((a, b) => new Date(b.created) - new Date(a.created));
	const userPost = sortedPosts.find(post => post.uid == uid);

	if (userPost) {
		const filteredPosts = sortedPosts.filter(post => post.id != userPost.id);
		return [userPost, ...filteredPosts].slice(0, n);
	}

	return sortedPosts.slice(0, n);
};

fetchMessages = async (token, n) => {
	const response = await fetch('/api/messages/inbox', {
		headers: { 'Authorization': 'Bearer ' + token }
	});

	const messages = await response.json();

	messages.forEach(msg => {
		// fix newlines
		msg.content = msg.content.split('\n').map((str, i) => React.createElement(
			'p',
			{ key: i },
			str
		));
	});

	const sortedMessages = messages.sort((a, b) => new Date(b.created) - new Date(a.created));
	return sortedMessages.slice(0, n);
};

getUser = async () => {
	const token = document.cookie;

	if (!token) return window.location = '/login';

	const response = await fetch('/api/auth/verify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token })
	});

	if (response.status != 200) {
		// invalid token
		document.cookie = null;
		return window.location = '/login';
	}

	const user = await response.json();
	return user;
};