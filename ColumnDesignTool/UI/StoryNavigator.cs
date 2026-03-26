using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;
using ColumnDesignTool.Models;

namespace ColumnDesignTool.UI
{
    /// <summary>
    /// Left-panel control listing stories with colour-coded design status badges.
    /// Fires <see cref="StorySelected"/> when the user picks a story.
    /// </summary>
    public class StoryNavigator : Panel
    {
        public event EventHandler<StoryData> StorySelected;

        private readonly ListBox _list = new ListBox();
        private List<StoryData> _stories = new List<StoryData>();

        public StoryNavigator()
        {
            Width  = 180;
            Dock   = DockStyle.Left;
            BorderStyle = BorderStyle.FixedSingle;

            var header = new Label
            {
                Text      = "STORIES",
                Dock      = DockStyle.Top,
                Height    = 30,
                TextAlign = ContentAlignment.MiddleCenter,
                Font      = new Font("Segoe UI", 9f, FontStyle.Bold),
                BackColor = Color.FromArgb(45, 62, 80),
                ForeColor = Color.White
            };

            _list.Dock              = DockStyle.Fill;
            _list.DrawMode          = DrawMode.OwnerDrawFixed;
            _list.ItemHeight        = 36;
            _list.DrawItem         += DrawStoryItem;
            _list.SelectedIndexChanged += OnSelectionChanged;

            Controls.Add(_list);
            Controls.Add(header);
        }

        public void LoadStories(List<StoryData> stories)
        {
            _stories = stories;
            _list.Items.Clear();
            foreach (var s in stories)
                _list.Items.Add(s);
        }

        public void RefreshStatus() => _list.Invalidate();

        private void DrawStoryItem(object sender, DrawItemEventArgs e)
        {
            if (e.Index < 0 || e.Index >= _stories.Count) return;
            var story = (StoryData)_list.Items[e.Index];

            bool selected = (e.State & DrawItemState.Selected) != 0;
            e.Graphics.FillRectangle(
                selected ? new SolidBrush(Color.FromArgb(52, 152, 219))
                         : new SolidBrush(Color.White),
                e.Bounds);

            // Status dot
            Color dot = story.Status switch
            {
                DesignStatus.Pass    => Color.LimeGreen,
                DesignStatus.Warning => Color.Orange,
                DesignStatus.Fail    => Color.Red,
                _                   => Color.LightGray
            };
            e.Graphics.FillEllipse(new SolidBrush(dot),
                e.Bounds.Left + 8, e.Bounds.Top + 10, 14, 14);

            // Story name + height
            using var fnt = new Font("Segoe UI", 9f);
            using var sfnt = new Font("Segoe UI", 7.5f);
            Color textColor = selected ? Color.White : Color.Black;
            e.Graphics.DrawString(story.Name, fnt,
                new SolidBrush(textColor),
                e.Bounds.Left + 28, e.Bounds.Top + 4);
            e.Graphics.DrawString($"h = {story.Height / 1000.0:F2} m", sfnt,
                new SolidBrush(selected ? Color.LightCyan : Color.Gray),
                e.Bounds.Left + 28, e.Bounds.Top + 20);
        }

        private void OnSelectionChanged(object sender, EventArgs e)
        {
            if (_list.SelectedItem is StoryData s)
                StorySelected?.Invoke(this, s);
        }
    }
}
