"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface Item {
  from: number;
  to: number;
  resource: string;
  amount: number;
}

interface JsonData {
  items: Item[];
}

interface Realm {
  id: number;
  name: string;
  output: string[];
}

interface RealmsData {
  realms: Realm[];
}

const REALMS_DATA_KEY = "eternum_realms_data";

const REALMS_DATA_EXAMPLE = `{
  "realms": [
    {
      "id": 4604,
      "name": "Ememurd",
      "output": ["Donkey", "Copper"]
    }
  ]
}`;

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [realmId, setRealmId] = useState("");
  const [result, setResult] = useState<JsonData | null>(null);
  const [copied, setCopied] = useState(false);
  const [realmsData, setRealmsData] = useState<RealmsData>({ realms: [] });
  const [selectedRealm, setSelectedRealm] = useState<string>("");

  useEffect(() => {
    const savedRealmsData = localStorage.getItem(REALMS_DATA_KEY);
    if (savedRealmsData) {
      try {
        const parsedData = JSON.parse(savedRealmsData);
        setRealmsData(parsedData);
      } catch (error) {
        console.error("Error loading saved realms data:", error);
      }
    }
  }, []);

  const handleRealmsDataChange = (value: string) => {
    try {
      const parsedData: RealmsData = JSON.parse(value);
      setRealmsData(parsedData);
      localStorage.setItem(REALMS_DATA_KEY, value);
    } catch (error) {
      console.error("Error parsing realms data:", error);
      alert("Invalid realms data format. Please check your input.");
    }
  };

  const donkeyRealms = realmsData.realms.filter((realm) =>
    realm.output.includes("Donkey")
  );

  useEffect(() => {
    if (donkeyRealms.length > 0 && selectedRealm === "") {
      setSelectedRealm(donkeyRealms[0].id.toString());
    }
  }, [donkeyRealms, selectedRealm]);

  useEffect(() => {
    if (selectedRealm !== "custom") {
      const realm = realmsData.realms.find(
        (r) => r.id.toString() === selectedRealm
      );
      if (realm) {
        setRealmId(realm.id.toString());
      }
    }
  }, [selectedRealm, realmsData.realms]);

  const handleMultiply = () => {
    try {
      const data: JsonData = JSON.parse(jsonInput);
      const factor = parseFloat(multiplier);

      if (isNaN(factor)) {
        throw new Error("Invalid multiplier");
      }

      const multipliedData: JsonData = {
        items: data.items.map((item) => ({
          ...item,
          amount: Math.round(item.amount * factor),
        })),
      };

      setResult(multipliedData);
    } catch (error) {
      console.error("Error processing data:", error);
      alert("Error processing data. Please check your inputs.");
    }
  };

  const handleSendDonkeys = () => {
    try {
      const data: JsonData = JSON.parse(jsonInput);
      const fromRealmId = parseInt(realmId);

      if (isNaN(fromRealmId)) {
        throw new Error("Invalid Realm ID");
      }

      const donkeyData: JsonData = {
        items: data.items
          .map((item) => {
            const donkeyAmount = Math.ceil(item.amount / 500);
            return {
              from: fromRealmId,
              to: item.from,
              resource: "Donkey",
              amount: donkeyAmount,
            };
          })
          .filter((item) => item.amount > 0)
          .reduce((acc: Item[], current) => {
            const existing = acc.find((item) => item.to === current.to);
            if (existing) {
              existing.amount += current.amount;
            } else {
              acc.push(current);
            }
            return acc;
          }, [] as Item[]),
      };

      setResult(donkeyData);
    } catch (error) {
      console.error("Error processing data:", error);
      alert("Error processing data. Please check your inputs.");
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Eternum Resource Manager</h1>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <label htmlFor="realms-data" className="block text-sm font-semibold">
            Realms Data
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Input your realms data in JSON format. Example:</p>
                <pre className="mt-2 text-sm p-2 rounded">
                  {REALMS_DATA_EXAMPLE}
                </pre>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="realms-data"
          placeholder="Paste your realms data here"
          className="h-32"
          value={JSON.stringify(realmsData, null, 2)}
          onChange={(e) => handleRealmsDataChange(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </div>
      <Tabs defaultValue="multiply" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="multiply">Multiply</TabsTrigger>
          <TabsTrigger value="send-donkeys">Send Donkeys</TabsTrigger>
        </TabsList>
        <div className="mt-4 space-y-4">
          <div>
          <div className="flex items-center gap-2 mb-1">
            <label
              htmlFor="json-input"
              className="block text-sm font-semibold mb-1"
            >
              JSON Input
            </label>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Put your original JSON for your transfers here.</p>
              
              </TooltipContent>
            </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="json-input"
            placeholder="Paste your JSON here"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="h-64"
            />
          </div>
          <TabsContent value="multiply" className="space-y-4">
            <div>
              <label
                htmlFor="multiplier"
                className="block text-sm font-semibold mb-1"
              >
                Multiplier
              </label>
              <Input
                id="multiplier"
                type="number"
                className="no-spinner"
                placeholder="Enter multiplier"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
              />
            </div>
            <Button onClick={handleMultiply}>Multiply</Button>
          </TabsContent>
          <TabsContent value="send-donkeys" className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="realm-select"
                className="block text-sm font-semibold"
              >
                Select Realm to send Donkeys from
              </label>
              <Select value={selectedRealm} onValueChange={setSelectedRealm}>
                <SelectTrigger id="realm-select">
                  <SelectValue placeholder="Select a realm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  {donkeyRealms.map((realm) => (
                    <SelectItem key={realm.id} value={realm.id.toString()}>
                      {realm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRealm === "custom" && (
              <div>
                <label
                  htmlFor="realm-id"
                  className="block text-sm font-semibold mb-1"
                >
                  Realm ID
                </label>
                <Input
                  id="realm-id"
                  type="number"
                  placeholder="Enter Realm ID"
                  value={realmId}
                  onChange={(e) => setRealmId(e.target.value)}
                />
              </div>
            )}
            {selectedRealm !== "custom" && (
              <div>
                <label
                  htmlFor="realm-id"
                  className="block text-sm font-semibold mb-1"
                >
                  Realm ID
                </label>
                <Input id="realm-id" type="number" value={realmId} disabled />
              </div>
            )}
            <Button onClick={handleSendDonkeys}>Send Donkeys</Button>
          </TabsContent>
        </div>
        {result && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Result:</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </Tabs>
    </main>
  );
}
