using System;
using System.Windows.Forms;
using ColumnDesignTool.UI;

[assembly: System.Runtime.Versioning.SupportedOSPlatform("windows")]

namespace ColumnDesignTool
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.Run(new Form1());
        }
    }
}
