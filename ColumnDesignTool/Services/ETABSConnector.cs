using System;
using System.Collections.Generic;
using ColumnDesignTool.Models;

namespace ColumnDesignTool.Services
{
    /// <summary>
    /// Connects to a running ETABS instance via COM interop and extracts
    /// story/column data.  Reference: ETABS Object Library v18+ (ETABSv1.dll).
    /// </summary>
    public class ETABSConnector : IDisposable
    {
        // COM types are referenced via dynamic to avoid hard build dependency.
        private dynamic _etabsObject;
        private dynamic _model;
        private bool    _connected;

        // ------------------------------------------------------------------ //
        //  Connection
        // ------------------------------------------------------------------ //

        public void Connect()
        {
            try
            {
                // Late-bind to running ETABS instance
                var comType = Type.GetTypeFromProgID("CSI.ETABS.API.ETABSObject");
                _etabsObject = Activator.CreateInstance(comType);
                _model       = _etabsObject.SapModel;
                _connected   = true;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Could not connect to ETABS. Make sure ETABS is running. ({ex.Message})", ex);
            }
        }

        public bool IsConnected => _connected;

        // ------------------------------------------------------------------ //
        //  Story extraction
        // ------------------------------------------------------------------ //

        public List<StoryData> ExtractStories()
        {
            EnsureConnected();
            var stories = new List<StoryData>();

            int      count        = 0;
            string[] storyNames   = null;
            double[] elevations   = null;
            double[] heights      = null;
            bool[]   masterStory  = null;
            string[] similarTo    = null;
            bool[]   spliceAbove  = null;
            double[] spliceHeight = null;
            int[]    color        = null;

            _model.Story.GetStories_2(
                ref count, ref storyNames, ref elevations,
                ref heights, ref masterStory, ref similarTo,
                ref spliceAbove, ref spliceHeight, ref color);

            for (int i = 0; i < count; i++)
            {
                stories.Add(new StoryData
                {
                    Name   = storyNames[i],
                    Height = heights[i] * 1000   // m → mm
                });
            }

            return stories;
        }

        // ------------------------------------------------------------------ //
        //  Column labels per story
        // ------------------------------------------------------------------ //

        public List<string> GetColumnLabels(string storyName)
        {
            EnsureConnected();
            var labels = new List<string>();

            int      count      = 0;
            string[] frameNames = null;
            _model.FrameObj.GetAllFrames(ref count, ref frameNames);

            foreach (var name in frameNames)
            {
                string story = null;
                string label = null;
                _model.FrameObj.GetLabelFromName(name, ref label, ref story);
                if (string.Equals(story, storyName, StringComparison.OrdinalIgnoreCase))
                    labels.Add(name);
            }

            return labels;
        }

        // ------------------------------------------------------------------ //
        //  Internal forces for a column under a given load combination
        // ------------------------------------------------------------------ //

        public ColumnLoads GetColumnLoads(string columnName, string loadCombo)
        {
            EnsureConnected();

            int      numberResults = 0;
            string[] obj           = null;
            string[] elm           = null;
            string[] loadCase      = null;
            string[] stepType      = null;
            double[] stepNum       = null;
            double[] P             = null;
            double[] V2            = null;
            double[] V3            = null;
            double[] T             = null;
            double[] M2            = null;
            double[] M3            = null;

            // ObjectElm = 0
            _model.Results.FrameForce(
                columnName, 0, ref numberResults,
                ref obj, ref elm, ref loadCase, ref stepType, ref stepNum,
                ref P, ref V2, ref V3, ref T, ref M2, ref M3);

            // Take worst (max absolute) values across all sections
            double maxP  = 0, maxMx = 0, maxMy = 0, maxVx = 0, maxVy = 0, maxT = 0;
            for (int i = 0; i < numberResults; i++)
            {
                if (Math.Abs(P[i])  > Math.Abs(maxP))  maxP  = P[i];
                if (Math.Abs(M2[i]) > Math.Abs(maxMx)) maxMx = M2[i];
                if (Math.Abs(M3[i]) > Math.Abs(maxMy)) maxMy = M3[i];
                if (Math.Abs(V2[i]) > Math.Abs(maxVx)) maxVx = V2[i];
                if (Math.Abs(V3[i]) > Math.Abs(maxVy)) maxVy = V3[i];
                if (Math.Abs(T[i])  > Math.Abs(maxT))  maxT  = T[i];
            }

            return new ColumnLoads
            {
                P               = Math.Abs(maxP),
                Mx              = Math.Abs(maxMx),
                My              = Math.Abs(maxMy),
                Vx              = Math.Abs(maxVx),
                Vy              = Math.Abs(maxVy),
                T               = Math.Abs(maxT),
                LoadCombination = loadCombo
            };
        }

        // ------------------------------------------------------------------ //
        //  Load combinations defined in model
        // ------------------------------------------------------------------ //

        public List<string> GetLoadCombinationNames()
        {
            EnsureConnected();
            int      count = 0;
            string[] names = null;
            _model.RespCombo.GetNameList(ref count, ref names);
            return new List<string>(names ?? new string[0]);
        }

        // ------------------------------------------------------------------ //
        //  Helpers
        // ------------------------------------------------------------------ //

        private void EnsureConnected()
        {
            if (!_connected)
                throw new InvalidOperationException("Not connected to ETABS. Call Connect() first.");
        }

        public void Dispose()
        {
            if (_etabsObject != null)
            {
                try { _etabsObject.ApplicationExit(false); }
                catch { /* ignore */ }
                _etabsObject = null;
                _model       = null;
                _connected   = false;
            }
        }
    }
}
