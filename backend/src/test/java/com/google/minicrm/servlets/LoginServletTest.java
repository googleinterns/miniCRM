package com.google.minicrm.servlets;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalUserServiceTestConfig;
import com.google.gson.Gson;
import java.io.PrintWriter;
import java.io.StringWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Provides Unit Tests for the LoginServlet at endpoint api/login
 */
@RunWith(JUnit4.class)
public class LoginServletTest {
  private static final LocalServiceTestHelper loggedInHelper =
      new LocalServiceTestHelper(new LocalUserServiceTestConfig()).setEnvIsLoggedIn(true);
  private static final LocalServiceTestHelper loggedOutHelper =
      new LocalServiceTestHelper(new LocalUserServiceTestConfig()).setEnvIsLoggedIn(false);
  private final Gson gson = new Gson();
  private final LoginServlet loginServlet = new LoginServlet();

  private HttpServletRequest request;
  private HttpServletResponse response;

  @Before
  public void setUp() {
    request = mock(HttpServletRequest.class);
    response = mock(HttpServletResponse.class);
    loginServlet.init();
  }

  @Test
  public void loginServletGetRequest_whenLoggedIn_returnsLoggedIn() throws Exception {
    loggedInHelper.setUp();

    LoginGetResponse getResponse = loginServletGetResponse();

    assertEquals(true, getResponse.loggedIn);
    loggedInHelper.tearDown();
  }

  @Test
  public void loginServletGetRequest_whenLoggedOut_returnsNotLoggedIn() throws Exception {
    loggedOutHelper.setUp();

    LoginGetResponse getResponse = loginServletGetResponse();

    assertEquals(false, getResponse.loggedIn);
    loggedOutHelper.tearDown();
  }

  /**
   * Calls the login servlet's GET method and returns the response object
   * @return the response object returned by the login servlet
   * @throws Exception
   */
  private LoginGetResponse loginServletGetResponse() throws Exception {
    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    loginServlet.doGet(request, response);

    writer.flush();
    return gson.fromJson(stringWriter.toString(), LoginGetResponse.class);
  }

  private class LoginGetResponse {
    private String url;
    private boolean loggedIn;
  }
}
