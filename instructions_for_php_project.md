## Instructions for Running Your PHP Project

I noticed you are using a PHP project for 'campus'. PHP projects need a web server like Apache to run correctly. I've updated the link in your `index.html` to point to `http://localhost/webs/campus`, which is a common setup.

For this link to work, you need to make sure your project files are in the correct folder for your Apache server.

### 1. Find your Apache's `htdocs` folder

This is the main folder where your web server looks for websites. Common locations are:
- If you use XAMPP: `C:\xampp\htdocs`
- If you use WAMP: `C:\wamp\www`
- Or another similar folder depending on your server setup.

### 2. Move your `webs` folder

Your `webs` folder (which contains both `portfilo` and `campus`) is currently in `c:\Users\Ahmad Muhammad\Downloads`.

You should move the entire `webs` folder into your server's `htdocs` folder. The final structure should look like this:

```
C:
└── xampp
    └── htdocs
        └── webs
            ├── campus
            │   └── index.php (and other PHP files)
            └── portfilo
                └── index.html
```

### 3. Restart Apache

After moving the folder, it's a good idea to restart your Apache server.

### 4. Test the link

Once you've done this, the link in your portfolio should work correctly and open your campus project in a new tab.

If you still see a "Not Found" error, it means the `campus` folder is not in the right place. Please double-check the location and the folder name.
