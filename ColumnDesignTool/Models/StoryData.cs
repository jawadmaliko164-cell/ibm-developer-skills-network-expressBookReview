using System.Collections.Generic;

namespace ColumnDesignTool.Models
{
    public class StoryData
    {
        public string Name { get; set; }
        public double Height { get; set; }  // mm
        public List<ColumnDesign> Columns { get; set; } = new List<ColumnDesign>();
        public DesignStatus Status { get; set; } = DesignStatus.Undesigned;
    }

    public enum DesignStatus { Undesigned, Pass, Warning, Fail }
}
