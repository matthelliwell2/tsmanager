# TagSpaces Tag Manager

An Angular application for managing tags and thumbnails across multiple files in the [TagSpaces application](https://www.tagspaces.org/). This tool allows you to 
* add or remove tags from hundreds of files at once using glob patterns for file selection.
* update thumbnails for many stl files in one go
* adjust individual thumbnails for an stl

The updated tags and thumbnails are all available to view and search in the TagSpace app.

The latest version is deployed at https://tsmanager-2y7d9m1we-matt-helliwells-projects.vercel.app/

## Usage

The website does not upload any of your files to a server - all the actions are done locally on your machine. Because the website access your local files, it will not work in Firefox or Safari. You will need to use Chrome. 

### Add and removing tags

1. Click on the 'File Tagging' tab.
2. Select the folder containing the files you want to update. 
3. Enter a file pattern for the files you want to update. This is a [glob](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns/). Common patterns are:
   * '**/*.*' - Matches all files in the selected directory and all subdirectories.
   * '**/*.stl' -  Match all files that end in '.stl' in the selected directory and all subdirectories.
   * '**/*archer*.stl' -  Match all files that have 'archer' in their name and end in '.stl' in the selected directory and all subdirectories.
4. Click 'Scan Files'

After a short pause, it will show you a list of files with controls to add and remove tags.

To add tags enter the tag name in the text box and click on 'Add Tag'. This doesn't change any yet. The summary at the bottom of the screen will update showing you what actions it will take. To enter multiple tags, enter them in the text box and click 'Add Tag' after each tag.

Remove remove tags, click the checkbox next to the tag. The summary at the bottom of the screen will update.

You can add and remove tags in one operation.

Once you are happy with the changes, click 'Apply Changes'. A progress bar will show you the progress. You can now go back into TagSpaces and see the new tags.

### Edit Thumbnails

Click on the 'Thumbnails' tab. As before, select a directory, file pattern and choose scan files. When you click on one of the matching files, you'll be shown a view of the model and the current TagSpaces thumbnail for that file. Use the mouse to zoom in and out and rotate the model view. Once you are happy with the view, click 'Copy' to save it as a thumbnail.

### Bulk Update Thumbnails

This creates a thumbnail for all the matched files. This only works with STL files so make sure there are only STL files in the list. The options are:
1. Overwrite existing thumbnails. If clicked, it will overwrite any existing thumbnail for that file. Otherwise it will skip that files.
2. Rotate. This swaps the Y and Z axis and gives the correct orientation for some models.