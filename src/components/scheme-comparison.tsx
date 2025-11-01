
"use client";

import { useLanguage } from "@/context/language-context";
import type { ArtisanScheme } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle } from "lucide-react";

type SchemeComparisonProps = {
    scheme1: ArtisanScheme;
    scheme2: ArtisanScheme;
};

export default function SchemeComparison({ scheme1, scheme2 }: SchemeComparisonProps) {
    const { t } = useLanguage();

    const allBenefits = [...new Set([...scheme1.benefits.map(b => b.title), ...scheme2.benefits.map(b => b.title)])];

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/3 font-bold">{t('feature')}</TableHead>
                            <TableHead className="text-center font-bold">{t(scheme1.name)}</TableHead>
                            <TableHead className="text-center font-bold">{t(scheme2.name)}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-semibold">{t('description')}</TableCell>
                            <TableCell className="text-sm">{t(scheme1.description)}</TableCell>
                            <TableCell className="text-sm">{t(scheme2.description)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3} className="font-bold text-primary bg-muted/50">{t('benefits')}</TableCell>
                        </TableRow>
                        {allBenefits.map(benefitTitle => (
                             <TableRow key={benefitTitle}>
                                <TableCell>{t(benefitTitle)}</TableCell>
                                <TableCell className="text-center">
                                    {scheme1.benefits.some(b => b.title === benefitTitle) && <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />}
                                </TableCell>
                                <TableCell className="text-center">
                                    {scheme2.benefits.some(b => b.title === benefitTitle) && <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />}
                                </TableCell>
                             </TableRow>
                        ))}
                         <TableRow>
                            <TableCell colSpan={3} className="font-bold text-primary bg-muted/50">{t('requiredDocs')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>
                                <ul className="list-disc pl-4 text-sm">
                                    {scheme1.requiredDocuments.map(doc => <li key={doc}>{t(doc)}</li>)}
                                </ul>
                            </TableCell>
                            <TableCell>
                                 <ul className="list-disc pl-4 text-sm">
                                    {scheme2.requiredDocuments.map(doc => <li key={doc}>{t(doc)}</li>)}
                                </ul>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
