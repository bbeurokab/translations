///////////////////////////////
// OidcClient config
///////////////////////////////
Oidc.Log.logger = console;
Oidc.Log.level = Oidc.Log.INFO;
var client = null;

function oidcLogin(appname) {
	var settings = {
		authority: 'https://accounts.kbb1.com/auth/realms/main',
		client_id: 'trl',
		redirect_uri: 'https://trl.kbb1.com/',
		post_logout_redirect_uri: 'https://trl.kbb1.com/login',
		response_type: 'id_token token',
		scope: 'profile',

		filterProtocolClaims: true,
		loadUserInfo: true
	};

	client = new Oidc.UserManager(settings);

	client.getUser().then(function(user) {
		if(user === null) {
			window.location = "/login";
		} else {
			var at = KJUR.jws.JWS.parse(user.access_token);
			var roles = at.payloadObj.realm_access.roles;
			var bbrole = roles.filter(role => role.match(/^(bb_user)$/)).length;
			var trlrole = roles.filter(role => role.match(/^(trl_user)$/)).length;
			var adminrole = roles.filter(role => role.match(/^(trl_admin)$/)).length;

			if(trlrole > 0 && appname.match(/^(main|mini)$/)) {
				trluser = user.profile;
				initApp();
			} else if(bbrole > 0 && appname.match(/^(chat)$/)) {
				trluser = user.profile;
				initApp();
			} else if(adminrole > 0 && appname.match(/^(admin)$/)) {
				trluser = user.profile;
				initApp();
			} else if(bbrole === 0) {
				console.log("User role does not authorized");
				trluser = user.profile;
				bootbox.alert("Access denied.", function() {
					client.signoutRedirect();
				});
			} else if(trlrole === 0 && appname.match(/^(main|mini)$/)) {
				console.log("User role does not authorized");
				trluser = user.profile;
				bootbox.alert("Access denied.", function() {
					client.signoutRedirect();
				});
			} else if(adminrole === 0 && appname.match(/^(admin)$/)) {
				console.log("User role does not authorized");
				trluser = user.profile;
				bootbox.alert("User does not have permission", function() {
					window.location = "/login";
				});
			} else {
				console.log("What just happend?");
			}
		}
	}).catch(function(error) {
		console.log("Error: ",error);
	});
}
