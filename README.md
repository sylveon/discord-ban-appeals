# Discord Ban Appeals

This is a form which allows users to appeal their bans from a Discord server.

By using OAuth2, it ensures users can't forge or fake appeals.

## How do I use this?

1. Create an application on the [Discord Developer Portal](https://discord.com/developers/applications).

2. In the **Bot** section of the newly created application's dashboard, create a bot account and invite it to your server with the **Ban Members** permission.  
   > **Pro tip**: Use a [permissions calculator](https://finitereality.github.io/permissions-calculator/) to generate the invite link!

3. In your server, create a channel dedicated to ban appeals. Ensure only mods and the bot can view the channel:  
   ![](https://cdn.discordapp.com/attachments/688870664941076514/743300978119278642/unknown.png)  
   The bot will also need the permission to send messages and embed images here.

4. In Discord's settings, go in the **Appearance** section and enable **Developer Mode**. You will need it soon.  
   ![](https://cdn.discordapp.com/attachments/688870664941076514/743301339752169522/unknown.png)

5. Click this button:  
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sylveon/discord-ban-appeals)

6. In the web page that shows, login to your GitHub or GitLab account. You will be presented fields to fill:  
   | Field name            | Instructions                                                                                                               |
   | :-------------------- | :------------------------------------------------------------------------------------------------------------------------- |
   | Client ID             | You can get this from the **General Information** section for the application you created in step 1.                       |
   | Client secret         | You can get this from the **General Information** section for the application you created in step 1.                       |
   | Bot token             | Get this in the **Bot** section that you used in step 2.                                                                   |
   | Guild ID              | This is where the developer mode you enabled in step 4 comes in handy. Right click your server icon and press **Copy ID**. |
   | Channel ID            | Same deal than the guild ID, but with the channel you created in step 3.                                                   |
   | JSON Web Token secret | Use a password manager to generate a password with ~50 characters, or mash your keyboard.                                  |

7. Login to the [Netlify dashboard](https://app.netlify.com) and go to the settings for your site.

8. Click **Change site name** and give it an appropriate name, or [setup a custom domain](https://docs.netlify.com/domains-https/custom-domains/).

9. Click **Deploys**, and then **Trigger deploy**. In the menu that shows up, hit **Deploy site**. This is important so that the new site name is propagated.

10. Go back to the [Discord Developer Portal](https://discord.com/developers/applications), open the dashboard for the application you created in step 1, and click on **OAuth2**.

11. Click on **Add Redirect** and enter `https://[site-name].netlify.app/.netlify/functions/oauth-callback`, replacing `[site-name]` by the name you picked in step 8 (or the entire Netlify domain by your own domain, if you opted for that).

12. Hit the green **Save Changes** button.

13. You should be good to go! You might want to test if it works as intended with an alt account, and if you encounter any problems feel free to [create an issue on GitHub](https://github.com/sylveon/discord-ban-appeals/issues/new).
