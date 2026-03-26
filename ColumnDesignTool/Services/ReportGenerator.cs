using System;
using System.IO;
using System.Text;
using ColumnDesignTool.Models;

namespace ColumnDesignTool.Services
{
    /// <summary>
    /// Generates plain-text and CSV design reports.
    /// Extend with iTextSharp / ClosedXML for PDF / Excel output.
    /// </summary>
    public class ReportGenerator
    {
        public string GenerateTextReport(StoryData story)
        {
            var sb = new StringBuilder();
            sb.AppendLine("=================================================================");
            sb.AppendLine($"  COLUMN DESIGN REPORT  |  Story: {story.Name}  (h={story.Height:F0} mm)");
            sb.AppendLine($"  Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine("=================================================================");

            foreach (var col in story.Columns)
            {
                sb.AppendLine();
                sb.AppendLine($"  Column: {col.Name}  ({col.Width}x{col.Depth} mm)");
                sb.AppendLine($"  Materials: Fcu={col.Fcu} MPa, Fy={col.Fy} MPa");
                sb.AppendLine($"  Overall Status: {col.OverallStatus}  " +
                              $"Max Utilization: {col.MaxUtilization:P1}");
                sb.AppendLine();
                sb.AppendLine("  Load Combo        |  P(kN)  | Mx(kN.m) | My(kN.m) | Bars   | Util  | Status");
                sb.AppendLine("  ─────────────────────────────────────────────────────────────────────────────");

                foreach (var lc in col.LoadCombinations)
                {
                    if (!lc.IsActive) continue;
                    sb.AppendLine($"  {lc.Name,-18}| {lc.AxialLoad,7:F1} | {lc.MomentX,8:F1} | {lc.MomentY,8:F1} " +
                                  $"| {lc.ProvidedBars,-7}| {lc.Utilization,5:P0} | {lc.Status}");
                }
            }

            sb.AppendLine();
            sb.AppendLine("=================================================================");
            return sb.ToString();
        }

        public void SaveTextReport(StoryData story, string filePath)
        {
            File.WriteAllText(filePath, GenerateTextReport(story), Encoding.UTF8);
        }

        public void SaveCsvReport(StoryData story, string filePath)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Story,Column,Width_mm,Depth_mm,Fcu_MPa,Fy_MPa,LoadCombo," +
                          "P_kN,Mx_kNm,My_kNm,RequiredBars,ProvidedBars,Utilization,Status");

            foreach (var col in story.Columns)
            {
                foreach (var lc in col.LoadCombinations)
                {
                    if (!lc.IsActive) continue;
                    sb.AppendLine(
                        $"{story.Name},{col.Name},{col.Width},{col.Depth}," +
                        $"{col.Fcu},{col.Fy},{lc.Name}," +
                        $"{lc.AxialLoad:F1},{lc.MomentX:F1},{lc.MomentY:F1}," +
                        $"{lc.RequiredBars},{lc.ProvidedBars},{lc.Utilization:F3},{lc.Status}");
                }
            }

            File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
        }
    }
}
