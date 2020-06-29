package com.google.step.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.users.User;
import com.google.gson.Gson;
import com.google.step.interfaces.ClientResponse;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
    /**
     * Checks state of user in this class.
     */
    private static UserService userService;

    @Override
    public void init() {
        userService = UserServiceFactory.getUserService();
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String url;
        boolean loggedIn = userService.isUserLoggedIn();
        if (loggedIn) {
            url = userService.createLogoutURL("/");
        } else {
            url = userService.createLoginURL("/crm/guide");
        }
        LoginClientResponse loginClientResponse = new LoginClientResponse(url, loggedIn);
        response.setContentType("application/json;");
        response.getWriter().println(loginClientResponse.toJson());
    }

    /**
     * Response object providing URL for logging in or logging out.
     */

    private final class LoginClientResponse implements ClientResponse {
        /**
         * URL for user to login/logout.
         */
        private String url;

        /**
         * True if user is logged in and false otherwise.
         */
        private boolean loggedIn;

        /**
         * Constructor for response to send back to user for authentication.
         * @param url URL for logging in or out.
         * @param loggedIn Whether user is logged in or out.
         */
        LoginClientResponse(String url, boolean loggedIn){
            this.url = url;
            this.loggedIn = loggedIn;
        }

        public String toJson(){
            Gson gson = new Gson();
            return gson.toJson(this);
        }
    }
}
